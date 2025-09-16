import { successResponse, errorResponse } from "../utils/reponsehandler";
import courseSection from "../models/courseSections";
import UserCourseProgress from "../models/userCourseProgress";

export const userCourseProgressResolver = {
  Query: {
    getUserProgress: async (_: any, { userId, courseId }: any) => {
      try {
        // Fetch all sections for the given course
        const allSections = await courseSection.find({ courseId }).lean();
        const totalSections = allSections.length;

        const progress = await UserCourseProgress.findOne({
          userId,
          courseId,
        }).lean();
        const completedSections = progress?.completedSections?.length || 0;

        const responseData = {
          totalSections: totalSections || 0,
          completedSections: completedSections || 0,
          completedSectionsID:progress?.completedSections ||[]
        };
        return successResponse(responseData, "Progress fetched successfully",200);
      } catch (err) {
    return errorResponse("Failed to fetch progress", err, 500);
      }
    },
  },

  Mutation: {
    markSectionComplete: async (
      _: any,
      { userId, courseId, sectionId }: any
    ) => {
      try {
        // 1. Check if the course exists and contains the section
        const course = await courseSection.findOne({
          _id: sectionId,
          courseId: courseId,
        });

          if (!course) {
            return errorResponse("Course or section not found", undefined, 404);
        }

        const progress = await UserCourseProgress.findOne({ userId, courseId });

        // If not exists, create
        if (!progress) {
          const newProgress = await UserCourseProgress.create({
            userId,
            courseId,
            completedSections: [sectionId],
          });
          return successResponse(newProgress, "Section marked as complete",200);
        } else {
          // If section not already marked complete
          if (!progress.completedSections.includes(sectionId)) {
            progress.completedSections.push(sectionId);
            await progress.save();
          }
          return successResponse(progress, "Section marked as complete",200);
        }
      } catch (err) {
    return errorResponse("Failed to mark section as complete", err, 500);
      }
    },

    unmarkSectionComplete: async (
      _: any,
      { userId, courseId, sectionId }: any
    ) => {
      try {
        // 1. Check if the course and section exist
        const sectionExists = await courseSection.findOne({
          _id: sectionId,
          courseId: courseId,
        });

          if (!sectionExists) {
            return errorResponse("Course or section not found", undefined, 404);
        }

        // 2. Find and update the user's progress
        const updatedProgress = await UserCourseProgress.findOneAndUpdate(
          { userId, courseId },
          { $pull: { completedSections: sectionId } },
          { new: true, lean: true }
        );

          if (!updatedProgress) {
            return errorResponse("User progress not found", undefined, 404);
        }

        return successResponse(
          updatedProgress,
          "Section unmarked successfully",200
        );
      } catch (err) {
    return errorResponse("Failed to unmark section", err, 500);
      }
    },
  },
};
