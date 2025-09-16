import Course from "../models/courses";
import { successResponse, errorResponse } from "../utils/reponsehandler";
import { requireAuth, withAuth } from "../middleware/auth";

export const courseResolver = {
  Query: {
    courses: async () => {
      try {
        const courses = await Course.find().lean();
        if (!courses.length)
          return errorResponse("No courses found", undefined, 404);
        return successResponse(
          courses.map((c) => ({ ...c, id: c._id.toString() })),
          "Courses fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Failed to fetch courses", err, 500);
      }
    },

    course: async (_: any, { id }: { id: string }) => {
      try {
        const course = await Course.findById(id).lean();
        if (!course) return errorResponse("Course not found", undefined, 404);
        return successResponse(
          { ...course, id: course._id.toString() },
          "Course fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Failed to fetch course", err, 500);
      }
    },

    coursesByIndex: async (_: any, { indexId }: { indexId: string }) => {
      try {
        const courses = await Course.find({ indexId }).lean();
        if (!courses.length)
          return errorResponse("No courses found for index", undefined, 404);
        return successResponse(
          courses.map((c) => ({ ...c, id: c._id.toString() })),
          "Courses fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Failed to fetch courses", err, 500);
      }
    },
  },

  Mutation: {
    createCourse: withAuth(
      async (_: any, { title, description, indexId }: any, context: any) => {
        try {
          if (!title || !description) {
            return errorResponse(
              "Pls add Title and Description",
              undefined,
              409
            );
          }

          const existingCourse = await Course.findOne({ title, indexId });
          if (existingCourse) {
            return errorResponse(
              "Course with this title already exists in the same index",
              undefined,
              409
            );
          }

          const course = await Course.create({ title, description, indexId });
          return successResponse(course, "Course created successfully", 200);
        } catch (err) {
          return errorResponse("Failed to create course", err, 500);
        }
      }
    ),

    updateCourse: withAuth(
      async (
        _: any,
        { id, title, description, indexId }: any,
        context: any
      ) => {
        try {
          if (!title || !description) {
            return errorResponse(
              "Pls add Title and Description",
              undefined,
              409
            );
          }
          const duplicate = await Course.findOne({
            title: title, // use new or old title
            indexId: indexId, // use new or old indexId
            _id: { $ne: id }, // exclude the current course
          });

          if (duplicate) {
            return errorResponse(
              "Another course with this title already exists in the same index",
              undefined,
              409
            );
          }

          // Proceed with update
          const course = await Course.findByIdAndUpdate(
            id,
            { title, description, indexId },
            { new: true }
          );
          if (!course) return errorResponse("Course not found", undefined, 404);
          return successResponse(course, "Course updated successfully", 200);
        } catch (err) {
          return errorResponse("Failed to update course", err, 500);
        }
      }
    ),

    deleteCourse: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const course = await Course.findByIdAndDelete(id);
        if (!course) return errorResponse("Course not found", undefined, 404);
        return successResponse(course, "Course deleted successfully", 200);
      } catch (err) {
        return errorResponse("Failed to delete course", err, 500);
      }
    }),
  },
};
