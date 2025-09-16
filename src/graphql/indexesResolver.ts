import { successResponse, errorResponse } from "../utils/reponsehandler";
import Index from "../models/indexes";
import Category from "../models/category";
import { requireAuth, withAuth } from "../middleware/auth";

export const indexResolver = {
  Query: {
    indexesByCategory: async (
      _: any,
      { categoryId }: { categoryId: string }
    ) => {
      try {
        const indexes = await Index.find({ categoryId }).lean();
          if (!indexes || indexes.length === 0) {
            return errorResponse("No indexes found for this category", undefined, 404);
        }

        const mappedIndexes = indexes.map((i) => ({
          ...i,
          id: i._id.toString(),
        }));

        return successResponse(mappedIndexes, "Indexes fetched successfully",200);
      } catch (err) {
    return errorResponse("Internal server error", err, 500);
      }
    },

    // ✅ New get-by-id API
    index: async (_: any, { id }: { id: string }) => {
      try {
        const index = await Index.findById(id).lean();
          if (!index) {
            return errorResponse("Index not found", undefined, 404);
        }

        const mappedIndex = { ...index, id: index._id.toString() };
        return successResponse(mappedIndex, "Index fetched successfully",200);
      } catch (err) {
    return errorResponse("Internal server error", err, 500);
      }
    },
  },

  Mutation: {
    createIndex: withAuth(async (_: any, { name, description, categoryId }: any, context: any) => {
      try {
        const categoryExists = await Category.findById(categoryId);
          if (!categoryExists) {
            return errorResponse("Invalid categoryId", undefined, 400);
        }
        const existingIndex = await Index.findOne({ name, categoryId });
        if (existingIndex) {
            return errorResponse(
              "Index with this name already exists in the same category",
              undefined,
              409
            );
        }

        const index: any = await Index.create({
          name,
          description,
          categoryId,
        });
        const mappedIndex = { ...index.toObject(), id: index._id.toString() };

        return successResponse(mappedIndex, "Index created successfully",200);
      } catch (err) {
    return errorResponse("Failed to create index", err, 500);
      }
    }),

    updateIndex: withAuth(async (_: any, { id, name, description, categoryId }: any, context: any) => {
      try {
        if (name && categoryId) {
          const duplicate = await Index.findOne({
            name,
            categoryId,
            _id: { $ne: id }, // exclude the index being updated
          });
          if (duplicate) {
              return errorResponse(
                "Another index with this name already exists in the same category",
                undefined,
                409
              );
          }
        }

        const index: any = await Index.findByIdAndUpdate(
          id,
          { name, description, categoryId },
          { new: true }
        );

          if (!index) {
            return errorResponse("Index not found", undefined, 404);
        }

        const mappedIndex = { ...index.toObject(), id: index._id.toString() };

        return successResponse(mappedIndex, "Index updated successfully",200);
      } catch (err) {
    return errorResponse("Failed to update index", err, 500);
      }
    }),

    deleteIndex: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const index: any = await Index.findByIdAndDelete(id);
          if (!index) {
            return errorResponse("Index not found", undefined, 404);
        }
        const mappedIndex = { ...index.toObject(), id: index._id.toString() };
        return successResponse(mappedIndex, "Index deleted successfully",200);
      } catch (err) {
          return errorResponse("Failed to delete index", err, 500);
      }
    }),
  },

  Index: {
    category: async (parent: any) => {
      return await Category.findById(parent.categoryId).lean();
    },
  },
};
