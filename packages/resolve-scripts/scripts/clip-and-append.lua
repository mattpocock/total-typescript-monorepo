--[[
Clip and Append Script for DaVinci Resolve
-----------------------------------------
This script is designed to work with DaVinci Resolve to append clips
to an existing timeline based on specified cut points.

Environment Variables Required:
- INPUT_VIDEO: Path to the video file to be processed
- CLIPS_TO_APPEND: String containing cut points in the format "startFrame___endFrame___isBadTake:::startFrame___endFrame___isBadTake"

Functionality:
1. Takes a video file and specified cut points
2. Adds the video to the media pool
3. Creates clips based on the specified cut points
4. Appends them to the existing timeline
5. Opens the Cut page in Resolve

Example Usage:
INPUT_VIDEO="/path/to/video.mp4"
CLIPS_TO_APPEND="0___100___1:::200___300___0"
]]

local resolve = Resolve()
local projectManager = resolve:GetProjectManager()
local project = projectManager:GetCurrentProject()

local mediaPool = project:GetMediaPool()

local folder = mediaPool:GetCurrentFolder()

local input = os.getenv('INPUT_VIDEO')

if not input then
  error('No INPUT_VIDEO provided')
end

local cuts = os.getenv('CLIPS_TO_APPEND')

if not cuts then
  error('No CLIPS_TO_APPEND provided')
end

local mediaStorage = resolve:GetMediaStorage()

local clips = mediaStorage:AddItemListToMediaPool(input)

local mediaId = clips[1]:GetMediaId()

local folderClips = folder:GetClipList()

local clip

for i, folderClip in ipairs(folderClips) do
  if folderClip:GetMediaId() == mediaId then
    clip = folderClip
    break
  end
end

local function split(pString, pPattern)
  local Table = {} -- NOTE: use {n = 0} in Lua-5.0
  local fpat = "(.-)" .. pPattern
  local last_end = 1
  local s, e, cap = pString:find(fpat, 1)
  while s do
    if s ~= 1 or cap ~= "" then
      table.insert(Table, cap)
    end
    last_end = e + 1
    s, e, cap = pString:find(fpat, last_end)
  end
  if last_end <= #pString then
    cap = pString:sub(last_end)
    table.insert(Table, cap)
  end
  return Table
end

local result = split(cuts, ':::')

local clipInfos = {}

for i, cut in ipairs(result) do
  local splitResult = split(cut, '___')
  clipInfos[i] = {
    startFrame = tonumber(splitResult[1]),
    endFrame = tonumber(splitResult[2]),
    isBadTake = splitResult[3] == "1",
    mediaPoolItem = clip
  }
end

-- Add a marker to the timeline
local timeline = project:GetCurrentTimeline()
local endFrame = timeline:GetEndFrame()
local startFrame = timeline:GetStartFrame()
timeline:AddMarker((endFrame - startFrame), "Blue", "Append Point", "Content appended after this point", 1)

local appendedItems = mediaPool:AppendToTimeline(clipInfos)

-- Set color to orange for bad takes
for i, clipInfo in ipairs(clipInfos) do
  if clipInfo.isBadTake then
    -- Get the timeline item that was just appended
    local timelineItem = appendedItems[i]
    if timelineItem then
      -- Set the clip color to orange
      timelineItem:SetClipColor("Orange")
    end
  end
end

resolve:OpenPage("cut")

