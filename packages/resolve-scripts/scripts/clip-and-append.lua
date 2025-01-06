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

print ('Media ID: ' .. mediaId)
print ('Cuts: ' .. cuts)

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
    mediaPoolItem = clip
  }
end

mediaPool:AppendToTimeline(clipInfos)

resolve:OpenPage("cut")

local timeline = project:GetCurrentTimeline()

