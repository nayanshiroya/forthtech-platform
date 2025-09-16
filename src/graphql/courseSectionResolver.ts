import { successResponse, errorResponse } from "../utils/reponsehandler";
import courseSection from "../models/courseSections";
import { withAuth } from "../middleware/auth";
const mapSection = (section: any) => ({
  ...section,
  id: section._id.toString(),
  content: {
    ...section.content,
    exercises: section.content.exercises?.map((e: any) => ({
      ...e,
      id: e._id.toString(),
    })),
    quizzes: section.content.quizzes?.map((q: any) => ({
      ...q,
      id: q._id.toString(),
    })),
  },
});

export const courseSectionResolver = {
  Query: {
    sectionsByCourse: async (_: any, { courseId }: { courseId: string }) => {
      try {
        const sections = await courseSection.find({ courseId }).lean();
        if (!sections.length)
          return errorResponse("No sections found", undefined, 404);
        return successResponse(
          sections.map((s) => mapSection(s)),
          "Sections fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Failed to fetch sections", err, 500);
      }
    },

    section: async (_: any, { id }: { id: string }) => {
      try {
        const section = await courseSection.findById(id).lean();
        if (!section) return errorResponse("Section not found", undefined, 404);
        return successResponse(
          mapSection(section),
          "Section fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Failed to fetch section", err, 500);
      }
    },
  },

  Mutation: {
    createSection: withAuth(
      async (
        _: any,
        { courseId, title, markdown, exercises, quizzes }: any,
        context: any
      ) => {
        try {
          if (!title) {
            return errorResponse("Pls add Title", undefined, 409);
          }

          const existingSection = await courseSection.findOne({
            courseId,
            title,
          });

          if (existingSection) {
            return errorResponse(
              "A section with this title already exists in this course.",
              null,
              409
            );
          }

          const section = await courseSection.create({
            courseId,
            title,
            content: {
              markdown,
              exercises: exercises || [],
              quizzes: quizzes || [],
            },
          });

          return successResponse(
            mapSection(section.toObject()),
            "Section created successfully",
            200
          );
        } catch (err) {
          console.error("Error creating section:", err);
          if (err instanceof Error) {
            console.error("Error details:", err.message);
            console.error("Error stack:", err.stack);
          }
          return errorResponse("Failed to create section", err, 500);
        }
      }
    ),

    updateSection: withAuth(
      async (
        _: any,
        { id, title, markdown, exercises, quizzes }: any,
        context: any
      ) => {
        try {
          if (!title) {
            return errorResponse("Pls add Title", undefined, 409);
          }

          const updates: any = {};
          const currentSection = await courseSection.findById(id);

          if (!currentSection) {
            return errorResponse("Section not found", undefined, 404);
          }

          const existingSection = await courseSection.findOne({
            courseId: currentSection.courseId,
            title: title,
            _id: { $ne: id },
          });

          if (existingSection) {
            return errorResponse(
              "A section with this title already exists in this course.",
              null,
              409
            );
          }

          if (title) updates.title = title;
          if (markdown) updates["content.markdown"] = markdown;

          // --- Exercises ---
          if (exercises && exercises.length > 0) {
            for (const ex of exercises) {
              if (ex.id) {
                // Update existing exercise by id
                await courseSection.updateOne(
                  { _id: id, "content.exercises._id": ex.id },
                  {
                    $set: {
                      "content.exercises.$.question": ex.question,
                      "content.exercises.$.hint": ex.hint,
                      "content.exercises.$.solution": ex.solution,
                    },
                  }
                );
              } else {
                console.log("ellelelleleekekek");
                // Add new exercise
                await courseSection.updateOne(
                  { _id: id },
                  { $push: { "content.exercises": ex } }
                );
              }
            }
          }

          // --- Quizzes ---
          if (quizzes && quizzes.length > 0) {
            for (const q of quizzes) {
              if (q.id) {
                // Update existing quiz
                await courseSection.updateOne(
                  { _id: id, "content.quizzes._id": q.id },
                  {
                    $set: {
                      "content.quizzes.$.question": q.question,
                      "content.quizzes.$.options": q.options,
                      "content.quizzes.$.answer": q.answer,
                    },
                  }
                );
              } else {
                // Add new quiz
                await courseSection.updateOne(
                  { _id: id },
                  { $push: { "content.quizzes": q } }
                );
              }
            }
          }

          // Apply simple updates (title, markdown)
          const section = await courseSection.findByIdAndUpdate(id, updates, {
            new: true,
          });

          if (!section)
            return errorResponse("Section not found", undefined, 404);

          return successResponse(
            mapSection(section.toObject()),
            "Section updated successfully",
            200
          );
        } catch (err) {
          return errorResponse("Failed to update section", err, 500);
        }
      }
    ),

    deleteSection: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const section = await courseSection.findByIdAndDelete(id);
        if (!section) return errorResponse("Section not found", undefined, 404);
        return successResponse(section, "Section deleted successfully", 200);
      } catch (err) {
        return errorResponse("Failed to delete section", err, 500);
      }
    }),

    deleteExercise: withAuth(
      async (_: any, { sectionId, exerciseId }: any, context: any) => {
        try {
          const result = await courseSection.updateOne(
            { _id: sectionId },
            { $pull: { "content.exercises": { _id: exerciseId } } }
          );
          if (result.modifiedCount === 0)
            return errorResponse(
              "Exercise not found or not deleted",
              undefined,
              404
            );
          const section = await courseSection.findById(sectionId);
          return successResponse(
            mapSection(section),
            "Exercise deleted successfully",
            200
          );
        } catch (err) {
          return errorResponse("Failed to delete exercise", err, 500);
        }
      }
    ),

    deleteQuiz: withAuth(
      async (_: any, { sectionId, quizId }: any, context: any) => {
        try {
          const result = await courseSection.updateOne(
            { _id: sectionId },
            { $pull: { "content.quizzes": { _id: quizId } } }
          );
          if (result.modifiedCount === 0)
            return errorResponse(
              "Quiz not found or not deleted",
              undefined,
              404
            );
          const section = await courseSection.findById(sectionId);
          return successResponse(
            mapSection(section),
            "Quiz deleted successfully",
            200
          );
        } catch (err) {
          return errorResponse("Failed to delete quiz", err, 500);
        }
      }
    ),
  },
};
