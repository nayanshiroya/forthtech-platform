import { gql } from "apollo-server-express";

const categoryTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    # Add other user fields as needed
  }

  type Category {
    id: ID!
    name: String!
    description: String!
    indexes: [Index]
    created_by: User # The new field to link to the User type
  }

  type CategoryResponse {
    status: Int!
    message: String
    error: String
    data: Category
  }

  type CategoryListResponse {
    status: Int!
    message: String
    error: String
    data: [Category]
  }

  extend type Query {
    categories: CategoryListResponse
    category(id: ID!): CategoryResponse
  }

  extend type Mutation {
    createCategory(name: String!, description: String!): CategoryResponse
    updateCategory(id: ID!, name: String, description: String!): CategoryResponse
    deleteCategory(id: ID!): CategoryResponse
  }
`;

export default categoryTypeDefs;
