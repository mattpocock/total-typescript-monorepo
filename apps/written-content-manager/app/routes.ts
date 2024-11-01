export const homeUrl = () => {
  return `/`;
};

export const dashboardUrl = () => {
  return `/`;
};

export const coursesUrl = () => {
  return `/courses`;
};

export const courseUrl = (courseId: string) => {
  return `/courses/${courseId}`;
};

export const addCourseUrl = (redirectTo: string) => {
  return `/courses/add?${new URLSearchParams({ redirectTo })}`;
};

export const deleteCourseUrl = (courseId: string, redirectTo: string) => {
  return `/courses/${courseId}/delete?${new URLSearchParams({ redirectTo })}`;
};

export const editCourseUrl = (courseId: string, redirectTo: string) => {
  return `/courses/${courseId}/edit?${new URLSearchParams({ redirectTo })}`;
};

export const printCourseToRepoUrl = (courseId: string) => {
  return `/courses/${courseId}/print-to-repo`;
};

export const syncRepoToExercisePlaygroundUrl = (courseId: string) => {
  return `/courses/${courseId}/sync-repo-to-exercise-playground`;
};

export const reorderSectionsUrl = (courseId: string) => {
  return `/courses/${courseId}/reorder`;
};

export const sectionUrl = (sectionId: string) => {
  return `/courses/sections/${sectionId}`;
};

export const addSectionUrl = (courseId: string, redirectTo: string) => {
  return `/courses/${courseId}/sections/add?${new URLSearchParams({ redirectTo })}`;
};

export const deleteSectionUrl = (sectionId: string, redirectTo: string) => {
  return `/courses/sections/${sectionId}/delete?${new URLSearchParams({ redirectTo })}`;
};

export const editSectionUrl = (sectionId: string, redirectTo: string) => {
  return `/courses/sections/${sectionId}/edit?${new URLSearchParams({ redirectTo })}`;
};

// export const exerciseUrl = (exerciseId: string) => {
//   return `/courses/exercises/${exerciseId}`;
// };

export const viewExerciseInVSCodeUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/view-vscode`;
};

export const createExerciseExplainerUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/create-explainer`;
};

export const createExerciseProblemSolutionUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/create-problem-solution`;
};

export const copyPreviousExerciseFilesUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/copy-previous-exercise-files`;
};

export const exerciseUploadAudioUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/upload-audio`;
};

export const exerciseDeleteAudioUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/delete-audio`;
};

export const exerciseAudioUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/audio.mkv`;
};

export const addExerciseDialogUrl = (sectionId: string) => {
  return `/courses/sections/${sectionId}?add`;
};

export const addExerciseUrl = (sectionId: string, redirectTo?: string) => {
  const params = redirectTo ? `?${new URLSearchParams({ redirectTo })}` : "";
  return `/courses/sections/${sectionId}/exercises/add${params}`;
};

export const deleteExerciseUrl = (exerciseId: string, redirectTo: string) => {
  return `/courses/exercises/${exerciseId}/delete?${new URLSearchParams({ redirectTo })}`;
};

export const editExerciseUrl = (exerciseId: string) => {
  return `/courses/exercises/${exerciseId}/edit`;
};

export const reorderExercisesUrl = (sectionId: string) => {
  return `/courses/sections/${sectionId}/reorder`;
};

export const postsUrl = () => {
  return `/posts`;
};

export const addPostUrl = () => {
  return `/posts/add`;
};

export const deletePostUrl = (postId: string, redirectTo: string) => {
  return `/posts/${postId}/delete?${new URLSearchParams({ redirectTo })}`;
};

export const editPostUrl = (postId: string) => {
  return `/posts/${postId}/edit`;
};

export const openPostInVSCodeUrl = (postId: string) => {
  return `/posts/${postId}/view-vscode`;
};

export const addNewCollectionToPostUrl = (postId: string) => {
  return `/posts/${postId}/add-new-collection`;
};

export const collectionsUrl = () => {
  return `/collections`;
};

export const addCollectionUrl = () => {
  return `/collections/add`;
};

export const deleteCollectionUrl = (collectionId: string) => {
  return `/collections/${collectionId}/delete`;
};

export const editCollectionUrl = (collectionId: string) => {
  return `/collections/${collectionId}/edit`;
};

export const addPostToCollectionUrl = (collectionId: string) => {
  return `/collections/${collectionId}/add-post`;
};

export const addNewPostToCollectionUrl = (collectionId: string) => {
  return `/collections/${collectionId}/add-new-post`;
};

export const removePostFromCollectionUrl = (
  collectionId: string,
  postId: string
) => {
  return `/collections/${collectionId}/posts/${postId}/remove`;
};

export const shotSlashUrl = (uri?: string) => {
  if (!uri) return `/shot-slash`;

  return `/shot-slash?${new URLSearchParams({ uri })}`;
};

export const shotSlashHtmlRendererFromCodeUrl = () => {
  return `/shot-slash/html-renderer-from-code`;
};

export const shotSlashHtmlRendererFromFileUrl = () => {
  return `/shot-slash/html-renderer-from-file-uri`;
};

export const getLearningGoalUrl = () => {
  return `/prompts/learning-goal`;
};
