(function (undefined) {

// Allow library to work in both the browser and in node.js
(typeof exports == "undefined" ? window : exports).prettify = prettify

function parse(xmlStr)
{
  var opener = /<(\w+)[^>]*?>/m,
      closer = /<\/[^>]*>/m;
  
  var idx = 0,
      indent = 0,
      processing = "",
      tags = [],
      output = [],
      token;
  
  while (idx < xmlStr.length)
  {
    processing += xmlStr[idx];
    
    if (token = getToken(opener, processing))
    {
      // Check if it is a singular element, e.g. <link />
      if (processing[processing.length - 2] != '/')
      {
        addLine(output, token.preContent, indent);
        addLine(output, token.match, indent);
        
        tags.push(token.tag);
        indent += 1;
        processing = "";
      }
      else
      {
        addLine(output, token.preContent, indent);
        addLine(output, token.match, indent);
        processing = "";
      }
    }
    else if (token = getToken(closer, processing))
    {
      addLine(output, token.preContent, indent);
      
      if (tags[tags.length] == token.tag)
      {
        tags.pop();
        indent -= 1;
      }
      
      addLine(output, token.match, indent);
      processing = "";
    }
    
    idx += 1;
  }
  
  if (tags.length && prettify.WARN)
  {
    console.log('WARNING: xmlFile may be malformed. Not all opening tags were closed. Following tags were left open:');
    console.log(tags);
  }
  
  return output;
}

function getToken(regex, str)
{
  if (regex.test(str))
  {
    var matches = regex.exec(str);
    var match = matches[0];
    var offset = str.length - match.length;
    var preContent = str.substring(0, offset);
    
    return {
      match:match,
      tag:matches[1],
      offset:offset,
      preContent:preContent
    };
  }
}

function addLine(output, content, indent)
{
  // Trim the content
  if (content = content.replace(/^\s+|\s+$/,""))
  {
    var tabs = ""
    
    while (indent--) { tabs += prettify.TAB; }
    output.push(tabs + content);
  }
}

function prettify(xmlStr)
{
  prettify.TAB = prettify.TAB || '\t';
  return parse(xmlStr).join('\n');
}

}());