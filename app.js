const express = require("express");
const app = express();
const Knowledge = require("./models/Note");
const Groq = require("groq-sdk");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");


const connectDB = require("./config/db");
connectDB();
require("dotenv").config();


app.use(express.json());
app.use(cors());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.get("/", (req, res) => {
    res.send("Second Brain Backend is running");
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    // ✅ Extract actual token (IMPORTANT FIX)
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;

    console.log("USER:", req.user); // 👈 debug

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

// GET NOTES (Protected + User-specific)
app.get("/notes", authMiddleware, async (req, res) => {
  try {
    const { search, tag, type, sort } = req.query;

    let query = {
      userId: req.user.id   // ✅ VERY IMPORTANT (user-specific data)
    };

    let sortOption = {};

    // Search in title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Sorting
    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const notes = await Knowledge.find(query)
      .sort(sortOption)
      .lean();

    res.json(notes);

  } catch (err) {
    res.status(500).send("Error fetching notes");
  }
});


// CREATE NOTE (Protected + Attach userId)
app.post("/notes", authMiddleware, async (req, res) => {
  try {
    const { title, content, type, tags, sourceUrl } = req.body;

    // Generate summary
    const summaryResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
Summarize the following note in 1–2 clear sentences.

Rules:
- Include ALL important actions and intentions
- Do NOT omit any detail
- Keep it concise but complete
- Use neutral, action-focused language
- Avoid personal pronouns
- Start directly with key actions

Note:
${content}
`
        }
      ],
      model: "llama-3.1-8b-instant"
    });

    const summary = summaryResponse.choices[0].message.content;

    let finalTags = tags;

    // Generate tags if user didn't send them
    if (!tags || tags.length === 0) {
      const tagResponse = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Generate 3–5 short tags for the following note. Return only comma separated tags.\n\n${content}`
          }
        ],
        model: "llama-3.1-8b-instant"
      });

      const tagText = tagResponse.choices[0].message.content;
      finalTags = tagText.split(",").map(tag => tag.trim());
    }

    const newNote = new Knowledge({
      title,
      content,
      type,
      sourceUrl,
      summary,
      tags: finalTags,
      userId: req.user.id   // ✅ attach user
    });

    await newNote.save();
    console.log(newNote);

    res.json({
      message: "Note created successfully",
      data: newNote
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving note");
  }
});

app.get("/notes/:id", async (req, res) => {
  const note = await Knowledge.findById(req.params.id);
  res.json(note);
});


app.delete("/notes/:id", async (req, res) => {
  try {
    await Knowledge.findByIdAndDelete(req.params.id);

    res.json({
      message: "Note deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting note");
  }
});


app.post("/api/summarize", async (req, res) => {
  try {
    const { content } = req.body;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
Summarize the following note in 1–2 clear sentences.

Rules:
- Include ALL important actions and intentions
- Do NOT omit any detail
- Keep it concise but complete
- Use neutral, action-focused language
- Avoid personal pronouns
- Start directly with key actions

Note:
${content}
`
        }
      ],
      model: "llama-3.1-8b-instant"
    });

    const summary = response.choices[0].message.content;

    res.json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error summarizing");
  }
});

app.post("/api/query", async (req, res) => {
  const { question } = req.body;

  // 1. Extract keywords using AI
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Extract 3-5 keywords from this query:\n${question}`
      }
    ],
    model: "llama-3.1-8b-instant"
  });

  const keywords = response.choices[0].message.content
    .split(",")
    .map(k => k.trim().toLowerCase());

  // 2. Fetch all notes
  const notes = await Knowledge.find();

  // 3. Filter notes
  const results = notes.filter(note => {
    const text = (
      note.title +
      note.summary +
      (note.tags || []).join(" ")
    ).toLowerCase();

    return keywords.some(k => text.includes(k));
  });

  res.json(results);
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (name.length < 5) {
      return res.status(400).json({ error: "Name must be 5+ characters" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be 8+ characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
  { id: user._id, name: user.name },
  "secretkey",
  { expiresIn: "1d" }
);

res.json({
  token,
  name: user.name
});

  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token, name: user.name });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(5000, () => {
    console.log("server is running....")
});