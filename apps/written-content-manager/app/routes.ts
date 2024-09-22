export const coursesUrl = () => {
  return `/`;
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

export const sectionUrl = (sectionId: string) => {
  return `/sections/${sectionId}`;
};

export const addSectionUrl = (courseId: string, redirectTo: string) => {
  return `/courses/${courseId}/sections/add?${new URLSearchParams({ redirectTo })}`;
};

export const deleteSectionUrl = (sectionId: string, redirectTo: string) => {
  return `/sections/${sectionId}/delete?${new URLSearchParams({ redirectTo })}`;
};

export const editSectionUrl = (sectionId: string, redirectTo: string) => {
  return `/sections/${sectionId}/edit?${new URLSearchParams({ redirectTo })}`;
};

// export const exerciseUrl = (exerciseId: string) => {
//   return `/exercises/${exerciseId}`;
// };

export const addExerciseDialogUrl = (sectionId: string) => {
  return `/sections/${sectionId}?add`;
};

export const addExerciseUrl = (sectionId: string, redirectTo?: string) => {
  const params = redirectTo ? `?${new URLSearchParams({ redirectTo })}` : "";
  return `/sections/${sectionId}/exercises/add${params}`;
};

export const deleteExerciseUrl = (exerciseId: string, redirectTo: string) => {
  return `/exercises/${exerciseId}/delete?${new URLSearchParams({ redirectTo })}`;
};

export const editExerciseUrl = (exerciseId: string) => {
  return `/exercises/${exerciseId}/edit`;
};

export const reorderExercisesUrl = (sectionId: string) => {
  return `/sections/${sectionId}/reorder`;
};
