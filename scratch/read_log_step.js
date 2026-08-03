const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\JULIAN\\Desktop\\GravyLocal2.0\\scratch\\subagent_244.txt', 'utf8');

const step44Index = content.indexOf('### Step 44: capture_browser_console_logs');
const step46Index = content.indexOf('### Step 46: browser_list_network_requests');

if (step44Index !== -1) {
  const step44Content = step46Index !== -1 
    ? content.substring(step44Index, step46Index)
    : content.substring(step44Index);
  console.log("=== Step 44 Content ===");
  console.log(step44Content);
} else {
  console.log("Step 44 not found in content");
}
