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
