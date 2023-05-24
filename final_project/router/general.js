const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");
const http = require("http");

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.params;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username or password not provided" });
  }

  let existingUsers = users.filter((user) => {
    return user.username === username;
  });
  if (existingUsers.length > 0) {
    return res.status(500).send("User already exists");
  } else {
    users.push ({username, password});
    return res.status(200).json({ message: "User registered successfully" });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(300).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(300).send(JSON.stringify(book));
  }
  return res
    .status(404)
    .json({ message: "Book not found using isbn: " + isbn });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const author = req.params.author;
  const bookKeyValuePair = Object.entries(books);
  const filtered = bookKeyValuePair.filter(
    ([key, value]) => value.author === author
  );
  return res.status(300).json(Object.entries(filtered));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const title = req.params.title;
  const bookKeyValuePair = Object.entries(books);
  const filtered = bookKeyValuePair.filter(([key, value]) =>
    value.title?.toLowerCase().includes(title.toLowerCase())
  );
  return res.status(300).json(Object.entries(filtered));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json(books[req.params.isbn].reviews);
});

const axiosAction = {
  getAllBooks: async () =>{
    http.get("http://localhost:4000/", (response) =>{
      let data = "";
      response.on("error", (err) =>{
        console.log(err.response ? err.response.data : err.message);
      });
      response.on("data", (chunk) =>{
        data+= chunk;
      });
      response.on("end", () =>{
        console.log(JSON.parse(data));
      });
    });
  },

  getBookByIsbn: (isbn) =>{
    axios.get("http://localhost:4000/isbn/"+isbn)
    .then((response) => {
      console.log("Get book by isbn")
      console.log(response.data);
    })
    .catch((err) => {
      console.log(err.response ? err.response.data : err.message);
    });
  },

  getBookByAuthor: async (author) =>{
    try{
      const {data} = await axios.get("http://localhost:4000/author/"+author);
      console.log("Get Book by Author");
      console.log(data);
    }
    catch (err) {
      console.log(err.response ? err.response.data : err.message);
    }
  },

  getBookByTitle: async (title) => {
    try{
      const {data} = await axios.get("http://localhost:4000/title/"+title);
      console.log("Get Book by Title", title);
      console.log(data);
    }catch (err) {
      console.log(err.response ? err.response.data : err.message);
    };
  }
};

axiosAction.getAllBooks();
axiosAction.getBookByIsbn(1);
axiosAction.getBookByAuthor("Hans Christian Andersen");
axiosAction.getBookByTitle("Pride and Prejudice");

module.exports.general = public_users;
