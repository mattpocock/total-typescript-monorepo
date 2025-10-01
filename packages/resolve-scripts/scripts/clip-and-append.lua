--[[
Multi-Track Clip and Append Script for DaVinci Resolve
-----------------------------------------------------
This script is designed to work with DaVinci Resolve to append clips
from multiple videos to an existing timeline, with each video on its own track.

Environment Variables Required:
- INPUT_VIDEOS: String containing paths to video files separated by ":::" 
- CLIPS_TO_APPEND: String containing clip information in the format 
  "startFrame___endFrame___videoIndex___[timelineStartFrame]:::startFrame___endFrame___videoIndex___[timelineStartFrame]"
  where timelineStartFrame is optional. If not provided, clips will be appended to the end of their respective tracks.
- NEW_TIMELINE_NAME: String containing the desired name for the timeline. The timeline will be created with this name.

Functionality:
1. Takes multiple video files and specified clip information
2. Adds all videos to the media pool
3. Creates clips based on the specified parameters
4. Places clips at specific timeline positions on their respective tracks
5. Opens the Cut page in Resolve

Example Usage:
INPUT_VIDEOS="/path/to/video1.mp4:::/path/to/video2.mp4"
CLIPS_TO_APPEND="0___100___0___500:::200___300___1:::50___150___0"
# First clip: placed at timeline frame 500 on track 1
# Second clip: appended to end of track 2  
# Third clip: appended to end of track 1
]]

local resolve = Resolve()
local projectManager = resolve:GetProjectManager()
local project = projectManager:GetCurrentProject()

local mediaPool = project:GetMediaPool()
local folder = mediaPool:GetCurrentFolder()

local inputVideos = os.getenv('INPUT_VIDEOS')

if not inputVideos then
  error('No INPUT_VIDEOS provided')
end

local clipsToAppend = os.getenv('CLIPS_TO_APPEND')

if not clipsToAppend then
  error('No CLIPS_TO_APPEND provided')
end

local mediaStorage = resolve:GetMediaStorage()

-- Split function for parsing strings
local function split(pString, pPattern)
  local Table = {}
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

-- Parse input videos
local videoPaths = split(inputVideos, ';')

-- Add all videos to media pool and create a mapping of video index to media pool item
local videoIndexToClip = {}
local folderClips = folder:GetClipList()

for videoIndex, videoPath in ipairs(videoPaths) do
  -- Add video to media pool
  local clips = mediaStorage:AddItemListToMediaPool(videoPath)
  local mediaId = clips[1]:GetMediaId()
  
  -- Find the clip in the folder
  local clip
  for i, folderClip in ipairs(folderClips) do
    if folderClip:GetMediaId() == mediaId then
      clip = folderClip
      break
    end
  end
  
  -- Store the clip with its index (0-based for the API)
  videoIndexToClip[videoIndex - 1] = clip
end

-- Get current timeline, create one if none exists
local timeline = project:GetCurrentTimeline()

local newTimelineName = os.getenv('NEW_TIMELINE_NAME')

if not newTimelineName then
  error('No NEW_TIMELINE_NAME provided')
end

if not timeline then
  print("No current timeline found. Creating a new timeline...")
  timeline = mediaPool:CreateEmptyTimeline(newTimelineName)
  if not timeline then
    error("Failed to create new timeline")
  end
  print("Created new timeline: " .. timeline:GetName())
else
  print("Using existing timeline: " .. timeline:GetName())
  -- Update existing timeline name to the required name
  print("Updating timeline name to: " .. newTimelineName)
  local success = timeline:SetName(newTimelineName)
  if success then
    print("Timeline name updated successfully to: " .. timeline:GetName())
  else
    print("Warning: Failed to update timeline name to: " .. newTimelineName)
  end
end

local globalTimelineStartFrame = timeline:GetStartFrame()

-- Parse clips to append
local clipData = split(clipsToAppend, ':::')

-- Process clips in the order they appear in CLIPS_TO_APPEND
for i, clipInfo in ipairs(clipData) do
  local parts = split(clipInfo, '___')
  local startFrame = tonumber(parts[1])
  local endFrame = tonumber(parts[2])
  local videoIndex = tonumber(parts[3])
  local timelineStartFrame = parts[4] and tonumber(parts[4]) or nil
  
  local clip = videoIndexToClip[videoIndex]
  if not clip then
    error('Video index ' .. videoIndex .. ' not found in input videos')
  end
  
  -- Ensure we have enough video tracks for this clip
  local currentVideoTracks = timeline:GetTrackCount("video")
  local requiredTrack = videoIndex + 1
  while currentVideoTracks < requiredTrack do
    timeline:AddTrack("video")
    currentVideoTracks = currentVideoTracks + 1
  end
  
  -- Create clip info for this clip
  local clipInfo = {
    startFrame = startFrame,
    endFrame = endFrame,
    mediaPoolItem = clip,
    trackIndex = requiredTrack
  }
  
  -- Only add recordFrame if timelineStartFrame is provided
  if timelineStartFrame then
    clipInfo.recordFrame = timelineStartFrame + globalTimelineStartFrame
  end
  
  -- Append this clip to the timeline immediately
  local clipInfos = {clipInfo}
  local appendedItems = mediaPool:AppendToTimeline(clipInfos)
end

-- Add a marker to the timeline
local globalTimelineEndFrame = timeline:GetEndFrame()
timeline:AddMarker((globalTimelineEndFrame - globalTimelineStartFrame), "Blue", "Multi-Track Append Point", "Content appended after this point", 1)

resolve:OpenPage("cut")

