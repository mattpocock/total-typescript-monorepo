local resolve = Resolve()
local projectManager = resolve:GetProjectManager()
local project = projectManager:GetCurrentProject()

if not project then
    print('No project open')
    os.exit()
end

local mediaStorage = resolve:GetMediaStorage()

local fileList = mediaStorage:GetFileList("/Users/matt/Desktop")

print(fileList[#fileList])

mediaStorage:AddItemListToMediaPool(fileList[#fileList])
