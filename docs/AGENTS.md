# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>agent-skills-creator</name>
<description>Create, validate, and manage Claude Code Agent Skills. Use when creating new skills, writing SKILL.md files, validating skill structure, or following skill best practices. Includes templates, generators, and validation tools for Windows.</description>
<location>global</location>
</skill>

<skill>
<name>ai-prompt-crafter</name>
<description>Creates optimized prompts for AI image generation across DALL-E 3, Flux, Ideogram, Recraft, Leonardo, Firefly, Stable Diffusion 3, ComfyUI, and Google Imagen. Use when user needs to generate images, stickers, artwork, illustrations, or wants to improve their AI prompts.</description>
<location>global</location>
</skill>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.</description>
<location>global</location>
</skill>

<skill>
<name>api-docs</name>
<description>Generate API documentation from code. Use when user says "document this API", "generate API docs", "create endpoint docs", or needs OpenAPI/REST documentation.</description>
<location>global</location>
</skill>

<skill>
<name>artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts. Use when user says "create artifact", "build component", "make interactive widget", or wants to create React/HTML artifacts.</description>
<location>global</location>
</skill>

<skill>
<name>auditor</name>
<description>Evidence-based codebase auditor with health scoring, gap analysis, and actionable remediation plans. Use when user says "audit this project", "project health check", "technical debt assessment", "code review", "compare audits", or wants comprehensive gap analysis with implementation planning.</description>
<location>global</location>
</skill>

<skill>
<name>auditor-clean</name>
<description>Evidence-based codebase auditor with health scoring, gap analysis, and actionable remediation plans. Use when user says "audit this project", "project health check", "technical debt assessment", "code review", "compare audits", or wants comprehensive gap analysis with implementation planning.</description>
<location>global</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>global</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.</description>
<location>global</location>
</skill>

<skill>
<name>changelog-generator</name>
<description>Generate user-friendly changelogs from git commits. Use when user says "create changelog", "release notes", "what changed since".</description>
<location>global</location>
</skill>

<skill>
<name>comfyui-workflow-builder</name>
<description>Generates optimized ComfyUI workflows for image generation, editing, and enhancement. Creates JSON workflow files using available models and provides step-by-step setup instructions. Use when user says "create ComfyUI workflow", "generate workflow JSON", or needs image generation pipelines.</description>
<location>global</location>
</skill>

<skill>
<name>commit-message</name>
<description>Generate conventional commit messages from code changes. Use when user says "write commit", "commit this", "commit message", or wants to document code changes.</description>
<location>global</location>
</skill>

<skill>
<name>competitive-ads-extractor</name>
<description>Extracts and analyzes competitors' ads from ad libraries (Facebook, LinkedIn, etc.) to understand what messaging, problems, and creative approaches are working. Helps inspire and improve your own ad campaigns. Use when user says "analyze competitor ads", "ad research", or "what ads are they running".</description>
<location>global</location>
</skill>

<skill>
<name>content-research-writer</name>
<description>Assists in writing high-quality content by conducting research, adding citations, improving hooks, iterating on outlines, and providing real-time feedback on each section. Transforms your writing process from solo effort to collaborative partnership. Use when user says "help me write", "research this topic", "add citations", or "improve my draft".</description>
<location>global</location>
</skill>

<skill>
<name>css-uiux-audit</name>
<description>Comprehensive CSS and UI/UX code review, issue identification, and automated fixing with documentation. Use when reviewing stylesheets, analyzing UI/UX patterns, auditing frontend code quality, fixing CSS issues, or documenting style improvements. Triggers on requests like "review my CSS", "audit UI/UX", "fix styling issues", "improve my styles", or "document CSS fixes".</description>
<location>global</location>
</skill>

<skill>
<name>developer-growth-analysis</name>
<description>Analyzes your recent Claude Code chat history to identify coding patterns, development gaps, and areas for improvement, curates relevant learning resources from HackerNews, and automatically sends a personalized growth report to your Slack DMs. Use when user says "analyze my coding patterns", "developer feedback", or "review my recent work".</description>
<location>global</location>
</skill>

<skill>
<name>docx</name>
<description>"Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"</description>
<location>global</location>
</skill>

<skill>
<name>domain-name-brainstormer</name>
<description>Generates creative domain name ideas for your project and checks availability across multiple TLDs (.com, .io, .dev, .ai, etc.). Saves hours of brainstorming and manual checking. Use when user says "suggest domain names", "find available domains", or "brainstorm URLs".</description>
<location>global</location>
</skill>

<skill>
<name>env-setup</name>
<description>Generate .env templates from codebase. Use when user says "setup env", "create .env", "environment variables", or needs to configure environment files.</description>
<location>global</location>
</skill>

<skill>
<name>error-debugger</name>
<description>Systematic debugging for any error. Use when user encounters errors, bugs, unexpected behavior, or says "debug this", "fix this error", "why isn't this working".</description>
<location>global</location>
</skill>

<skill>
<name>file-organizer</name>
<description>Organize files in a directory by type, date, or project. Use when user says "organize these files", "clean up this folder", "sort files", or wants to declutter a directory.</description>
<location>global</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create production-grade frontend interfaces with professional visual quality, accessibility, and responsive design. Use when building UI components, web pages, dashboards, or any interface that needs distinctive styling and expert-level CSS.</description>
<location>global</location>
</skill>

<skill>
<name>image-enhancer</name>
<description>Improves the quality of images, especially screenshots, by enhancing resolution, sharpness, and clarity. Perfect for preparing images for presentations, documentation, or social media posts. Use when user says "enhance this image", "improve quality", "sharpen screenshot", or "upscale photo".</description>
<location>global</location>
</skill>

<skill>
<name>image-optimizer</name>
<description>Compress, resize, and convert images for web/mobile. Handles PNG, JPG, WebP, SVG optimization. Use when user needs to optimize images for performance or convert formats.</description>
<location>global</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>global</location>
</skill>

<skill>
<name>invoice-organizer</name>
<description>Automatically organizes invoices and receipts for tax preparation by reading messy files, extracting key information, renaming them consistently, and sorting them into logical folders. Turns hours of manual bookkeeping into minutes of automated organization. Use when user says "organize invoices", "sort receipts", "prep for taxes", or "rename these files".</description>
<location>global</location>
</skill>

<skill>
<name>lead-research-assistant</name>
<description>Identifies high-quality leads for your product or service by analyzing your business, searching for target companies, and providing actionable contact strategies. Perfect for sales, business development, and marketing professionals. Use when user says "find leads", "prospect research", "sales targets", or "who should I contact".</description>
<location>global</location>
</skill>

<skill>
<name>logo-builder</name>
<description>Interactive logo designer that creates SVG and PNG logos through guided conversation. Use when the user wants to create a logo, design a brand mark, build an icon, or needs visual identity design. Supports text logos, icon logos, monograms, and abstract marks.</description>
<location>global</location>
</skill>

<skill>
<name>logo-designer</name>
<description>Create professional logo concepts with multiple directions, brand guidelines, and production files. Use when user needs logo design, brand identity, or visual mark creation.</description>
<location>global</location>
</skill>

<skill>
<name>logo-prompt-generator</name>
<description>Generate optimized prompts for AI logo generation across DALL-E 3, Flux, Ideogram, Recraft, Leonardo, Firefly, Stable Diffusion 3, ComfyUI, and Google Imagen. Includes workflows for Photoshop, Illustrator, and Figma vectorization. Use when creating logo concepts, brand identity visuals, or needing professional AI image generation prompts.</description>
<location>global</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>global</location>
</skill>

<skill>
<name>meeting-insights-analyzer</name>
<description>Analyzes meeting transcripts and recordings to uncover behavioral patterns, communication insights, and actionable feedback. Identifies when you avoid conflict, use filler words, dominate conversations, or miss opportunities to listen. Perfect for professionals seeking to improve their communication and leadership skills. Use when user says "analyze my meeting", "review transcript", "communication feedback", or "meeting patterns".</description>
<location>global</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>global</location>
</skill>

<skill>
<name>pptx</name>
<description>"Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"</description>
<location>global</location>
</skill>

<skill>
<name>raffle-winner-picker</name>
<description>Picks random winners from lists, spreadsheets, or Google Sheets for giveaways, raffles, and contests. Ensures fair, unbiased selection with transparency. Use when user says "pick a winner", "random selection", "run a raffle", or "choose from this list".</description>
<location>global</location>
</skill>

<skill>
<name>raw-image-processor</name>
<description>Expert guidance for RAW image editing workflows, providing step-by-step processing instructions, adjustment recommendations, and non-destructive editing best practices for professional photography. Use when user says "process RAW photos", "edit RAW files", "CR2 workflow", or "Lightroom tips".</description>
<location>global</location>
</skill>

<skill>
<name>react-component-generator</name>
<description>Scaffold React/TypeScript components with proper types and best practices. Use when user says "create component", "new component", "scaffold", or needs React components.</description>
<location>global</location>
</skill>

<skill>
<name>readme-generator</name>
<description>Generate README.md from codebase analysis. Use when user says "create readme", "document this project", "write readme", or needs project documentation.</description>
<location>global</location>
</skill>

<skill>
<name>real-estate-image-enhancer</name>
<description>Specialized image enhancement for real estate photography. Provides expert guidance on exposure correction, perspective fixes, HDR blending, sky replacement, and professional presentation optimization. Use when user says "enhance property photos", "real estate photo editing", or "fix listing images".</description>
<location>global</location>
</skill>

<skill>
<name>real-estate-listing-analyzer</name>
<description>Analyzes property listings to extract key data, generate comparisons, identify insights, and create professional real estate documentation for agents and investors. Use when user says "analyze listing", "compare properties", "property data", or "listing insights".</description>
<location>global</location>
</skill>

<skill>
<name>real-estate-market-analyzer</name>
<description>Analyzes real estate market trends, generates comparative market analyses, identifies investment opportunities, and creates professional market reports for agents and investors. Use when user says "market analysis", "CMA report", "investment analysis", or "property trends".</description>
<location>global</location>
</skill>

<skill>
<name>skill-auditor</name>
<description>Audit Claude Code skills for correct format and structure. Use when user says "audit skills", "check my skills", "validate skills", "skill health check", or wants to verify SKILL.md files are correctly formatted.</description>
<location>global</location>
</skill>

<skill>
<name>skill-builder</name>
<description>Interactively create new Claude Code skills through guided conversation. Use when user says "create a skill", "build a skill", "make a skill", "new skill", or wants to automate a repeated workflow into a reusable skill.</description>
<location>global</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations. Use when user says "create a skill", "build a skill", "make a new skill", or wants to extend Claude with custom capabilities.</description>
<location>global</location>
</skill>

<skill>
<name>skill-share</name>
<description>A skill that creates new Claude skills and automatically shares them on Slack using Rube for seamless team collaboration and skill discovery. Use when user says "share this skill", "publish skill to Slack", or "distribute to team".</description>
<location>global</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Toolkit for creating animated GIFs optimized for Slack, with validators for size constraints and composable animation primitives. This skill applies when users request animated GIFs or emoji animations for Slack from descriptions like "make me a GIF for Slack of X doing Y".</description>
<location>global</location>
</skill>

<skill>
<name>sticker-design-guide</name>
<description>Guidelines for creating print-ready stickers including dimensions, formats, bleed areas, and production specs. Use when designing stickers for print or digital use.</description>
<location>global</location>
</skill>

<skill>
<name>template-skill</name>
<description>Template for creating new Claude Code skills. Use this as a starting point when building custom skills - copy this folder and modify the SKILL.md content for your specific use case.</description>
<location>global</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly. Use when user says "apply theme", "style this", "change colors/fonts", or "make it look professional".</description>
<location>global</location>
</skill>

<skill>
<name>video-downloader</name>
<description>Downloads videos from YouTube and other platforms for offline viewing, editing, or archival. Handles various formats and quality options. Use when user says "download video", "save YouTube", "get video offline", or "extract from URL".</description>
<location>global</location>
</skill>

<skill>
<name>vite-csp-fix</name>
<description></description>
<location>global</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts. Use when user says "build web app", "create multi-component artifact", "complex React app", or needs advanced artifacts with routing and state management.</description>
<location>global</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Test local web applications using Playwright. Use when verifying frontend functionality, debugging UI behavior, capturing screenshots.</description>
<location>global</location>
</skill>

<skill>
<name>windows-docs</name>
<description>Create and clean documentation files for Windows users only. Use when user says "Create README File", "Create USERMANUAL File", "Create SETUPGUIDE File" to generate new Windows-only documentation. Use when user says "Convert this to Windows", "For Windows USER only", "Clean this README", "Make this repo Windows-only" to strip Linux/macOS content from existing .md/.txt files. Supports single file or entire folder/repo scanning.</description>
<location>global</location>
</skill>

<skill>
<name>xlsx</name>
<description>"Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"</description>
<location>global</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
