import { successResponse, errorResponse } from "../utils/reponsehandler";
import Category from "../models/category";
import { User } from "../models/user";
import Index from "../models/indexes";
import { withAuth } from "../middleware/auth";
export const categoryResolver = {
  Query: {
    categories: async () => {
      try {
        const categories = await Category.find().lean();
        if (!categories || categories.length === 0) {
          return errorResponse("No categories found", undefined, 404);
        }

        const mappedCategories = await Promise.all(
          categories.map(async (c) => {
            const indexes = await Index.find({ categoryId: c._id }).lean();
            return {
              ...c,
              id: c._id.toString(),
              indexes: indexes.map((i) => ({
                ...i,
                id: i._id.toString(),
              })),
            };
          })
        );

        return successResponse(
          mappedCategories,
          "Categories fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Internal server error", err, 500);
      }
    },

    category: async (_: any, { id }: { id: string }) => {
      try {
        const category = await Category.findById(id).lean();
        if (!category) {
          return errorResponse("Category not found", undefined, 404);
        }

        const indexes = await Index.find({ categoryId: id }).lean();

        const mappedCategory = {
          ...category,
          id: category._id.toString(),
          indexes: indexes.map((i) => ({
            ...i,
            id: i._id.toString(),
          })),
        };

        return successResponse(
          mappedCategory,
          "Category fetched successfully",
          200
        );
      } catch (err) {
        return errorResponse("Internal server error", err, 500);
      }
    },
  },

  Mutation: {
    createCategory: withAuth(
      async (_: any, { name, description }: any, context: any) => {
        try {
          if (!name || !description) {
            return errorResponse(
              "Pls add name and Description",
              undefined,
              409
            );
          }
          const exists = await Category.findOne({ name });
          if (exists) {
            return errorResponse("Category already exists", undefined, 409);
          }
          const category = await Category.create({
            name,
            description,
            created_by: context.user.userId,
          });
          return successResponse(
            category,
            "Categories added successfully",
            200
          );
        } catch (err) {
          return errorResponse("Failed to create category", err, 500);
        }
      }
    ),

    updateCategory: withAuth(
      async (_: any, { id, name, description }: any, context: any) => {
        try {
          if (!name || !description) {
            return errorResponse(
              "Pls add name and Description",
              undefined,
              409
            );
          }

          if (name) {
            const exists = await Category.findOne({ name, _id: { $ne: id } });
            if (exists) {
              return errorResponse(
                "Category with this name already exists",
                undefined,
                409
              );
            }
          }

          const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
          );
          if (!category) {
            return errorResponse("Category not found", undefined, 404);
          }
          return successResponse(
            category,
            "Category updated successfully",
            200
          );
        } catch (err) {
          return errorResponse("Failed to update category", err, 500);
        }
      }
    ),

    deleteCategory: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
          return errorResponse("Category not found", undefined, 404);
        }
        return successResponse(category, "Category deleted successfully", 200);
      } catch (err) {
        return errorResponse("Failed to delete category", err, 500);
      }
    }),
  },
  Category: {
    created_by: async (parent: any) => {
      try {
        // 'parent' is the Category object currently being resolved.
        // It contains the created_by ID from the database.
        const user = await User.findById(parent.created_by).lean();
        if (!user) {
          return null;
        }
        return {
          ...user,
          id: user._id.toString(), // Convert ObjectId to a string
        };
      } catch (err) {
        console.error("Error fetching user for category:", err);
        return null;
      }
    },
  },
};
