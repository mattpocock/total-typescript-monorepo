local resolve = Resolve()
local projectManager = resolve:GetProjectManager()
local project = projectManager:GetCurrentProject()

local timeline = project:GetCurrentTimeline()

local subtitleOptions = {}

subtitleOptions[resolve.SUBTITLE_LANGUAGE] = resolve.AUTO_CAPTION_ENGLISH
subtitleOptions[resolve.SUBTITLE_CHARS_PER_LINE] = 33

timeline:CreateSubtitlesFromAudio(subtitleOptions)