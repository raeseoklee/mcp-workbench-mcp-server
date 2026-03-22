Output docs/assets/claude-demo.gif

Set Shell "bash"
Set FontSize 14
Set Width 1000
Set Height 600
Set Theme "Dracula"
Set Framerate 30
Set PlaybackSpeed 1

Hide
Type "cd /Users/irae/Workspace/irae/mcp-workbench-mcp-server"
Enter
Type `function claude() { if [[ "$1" == "-p" ]]; then sleep 1; cat demo/claude-output.txt; else command claude "$@"; fi; }`
Enter
Sleep 500ms
Show

Sleep 800ms

# Show registered MCP server
Type "claude mcp list"
Sleep 300ms
Enter
Sleep 3s

Sleep 1s

# Ask Claude to use the inspect_server tool
Type `claude -p "Use the inspect_server tool to inspect this MCP server: transport=stdio, command=node, args=/Users/irae/Workspace/irae/mcp-workbench/examples/demo-mcp/dist/index.js" --dangerously-skip-permissions`
Sleep 500ms
Enter
Sleep 3s
Sleep 4s
