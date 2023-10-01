const express = require("express");
const _ = require("lodash");
const app = express();
const fetchData = require("./routes");

const port = process.env.PORT || 3000;

const memoizedFetchData = _.memoize(fetchData, (query) =>query, 10000);

app.get('/', (req, res) => {
    const homePageHtml = `
      <html>
        <head>
          <title>Home Page</title>
        </head>
        <body>
          <h2>Home Page!</h2>
          <a href="/api/blog-status">Go To Analytics</a>
        </body>
      </html>
    `;
  
    res.send(homePageHtml);
  });

app.get("/api/blog-status", async (req, res) => {
  try {
    const apiResponse = await memoizedFetchData();
    const blogs = apiResponse.blogs;

    const blogAnalytics = {};

    blogAnalytics.totalBlogs = `${blogs.length}`;

    const longestBlogTitle = _.maxBy(blogs, (blog) => blog.title.length);
    blogAnalytics.longestBlogTitle = longestBlogTitle.title;

    const blogsWithPrivacyInTitle = _.filter(blogs, (blog) =>
      blog.title.toLowerCase().includes("privacy")
    );
    blogAnalytics.blogsWithPrivacyInTitle = blogsWithPrivacyInTitle.length;
    
    const uniqueBlogTitles = _.uniqBy(blogs, 'title').map(blog => blog.title);
    blogAnalytics.uniqueBlogTitles = uniqueBlogTitles;

    res.json(blogAnalytics); 
  } catch (error) {
    res.status(500).json({ error: "API request failed" });
  }
});


const memoizedBlogSearch = _.memoize(async (query) => {
  const apiResponse = await memoizedFetchData();
  const blogs = apiResponse.blogs;

  const searchResults = _.filter(blogs, (blog) =>
    blog.title.toLowerCase().includes(query.toLowerCase())
  );

  return searchResults;
}, (query) => query , 10000);

app.get('/api/blog-search', async(req, res) => {
  const query = req.query.query || '';

  try {
    const searchResults = await memoizedBlogSearch(query);
    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: "API request failed" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Invalid request" });
});

app.listen(port, () => {
  console.log(`Server is running at : http://localhost:${port}/`);
});
