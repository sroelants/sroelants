const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const moment = require("moment");
moment.locale("en");

module.exports = function(eleventyConfig) {
  /* Copy assets to dist folder */
  eleventyConfig.addPassthroughCopy("src/assets/img");
  eleventyConfig.addPassthroughCopy("src/assets/js");

  /* Syntax Highlighting*/
  eleventyConfig.addPlugin(syntaxHighlight);

  /* Add KaTeX preprocessing to markdown-it */
  let markdownIt = require("markdown-it");
  let markdownItKatex = require("markdown-it-katex");
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };

  let markdownLib = markdownIt(options).use(markdownItKatex);
  eleventyConfig.setLibrary("md", markdownLib);

  /* Convert date objects to readable strings */
  eleventyConfig.addFilter("dateIso", date => {
    return moment(date).toISOString();
  });

  eleventyConfig.addFilter("dateReadable", date => {
    return moment(date).format("LL");
  });

  /* Front matter excerpts (v0.8.4)*/
  // eleventyConfig.setFrontMatterParsingOptions({
  //   excerpt: true,
  //   excerpt_separator: "---"
  // });
  //

  /* Post metadata (date, tags) shortcode */
  eleventyConfig.addShortcode("metadata", function(date, tags) {
    let tagMarkup = "";

    for (tag of tags) {
      if (tag != "post") {
        tagMarkup +=
          '<a href="/thoughts/tags/' + tag + '" class="tag">#' + tag + "</a>";
      }
    }

    return `
      <span class="post-metadata">
        Posted on 
        <span class="posted-date">
        <time datetime="${moment(date).toISOString()}">
          ${moment(date).format("LL")}
        </time>
        </span>
        ${tagMarkup}
      </span>`;
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
