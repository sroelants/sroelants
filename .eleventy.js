const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
// const typesetPlugin = require("eleventy-plugin-typeset");
const CleanCSS = require("clean-css");
const moment = require("moment");
moment.locale("en");

module.exports = function(eleventyConfig) {
  /* Copy assets to dist folder */
  eleventyConfig.addPassthroughCopy({
    "src/_includes/assets/img": "assets/img"
  });

  eleventyConfig.addPassthroughCopy({
    "src/_includes/assets/js": "assets/js"
  });

  eleventyConfig.addPassthroughCopy({
    "src/projects": "projects"
  });

  /* Syntax Highlighting*/
  eleventyConfig.addPlugin(syntaxHighlight);

  /* Advanced typesetting with Typeset.js */
  // eleventyConfig.addPlugin(typesetPlugin());

  /* Add KaTeX preprocessing to markdown-it */
  let markdownIt = require("markdown-it");
  let markdownItKatex = require("markdown-it-katex");
  let markdownFootnotes = require("markdown-it-footnote");

  let mdOptions = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
  };

  let markdownLib = markdownIt(mdOptions)
    .use(markdownItKatex)
    .use(markdownFootnotes);
  eleventyConfig.setLibrary("md", markdownLib);

  /* Convert date objects to readable strings */
  eleventyConfig.addFilter("dateIso", date => {
    return moment(date).toISOString();
  });

  eleventyConfig.addFilter("dateReadable", date => {
    return moment(date).format("LL");
  });

  /* Minify css */

  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  /* Front matter excerpts (v0.8.4)*/
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "---"
  });

  /* Sidenote shortcode */
  eleventyConfig.addPairedShortcode("sidenote", function(content, id) {
    return `<label for="sn-${id}" class="margin-toggle sidenote-number"></label>
            <input type="checkbox" id="sn-${id}" class="margin-toggle"/>
            <span class="sidenote"> ${content} </span>`;
  });

  /* Blog post metadata (date, tags) shortcode */
  eleventyConfig.addShortcode("metadata", function(date, tags = []) {
    let tagMarkup = "";

    for (tag of tags) {
      if (tag != "post") {
        tagMarkup +=
          '<div class="tag"><a href="/blog/tags/' +
          tag +
          '">' +
          tag +
          "</a></div>";
      }
    }

    return `
      <div class="post-metadata">
        ${tagMarkup}
        <span class="date">
        <time datetime="${moment(date).toISOString()}">
          ${moment(date).format("LL")}
        </time>
        </span>
      </div>`;
  });

  /* Safer slugify (allows apostrophes in titles, etc... */

  const slugify = require("slugify");
  eleventyConfig.addFilter("slug", input => {
    const options = {
      replacement: "-",
      remove: /[&,+()$~%.'":*?<>{}]/g,
      lower: true
    };
    return slugify(input, options);
  });

  return {
    dir: {
      input: "src",
      output: "dist"
    },
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk"
  };
};
