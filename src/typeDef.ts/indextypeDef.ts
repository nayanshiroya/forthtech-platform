import { gql } from "apollo-server-express";

const indexTypeDefs = gql`
  type Index {
    id: ID!
    name: String!
    description: String
    categoryId: ID!
    category: Category
  }

  type IndexResponse {
    status: Int!
    message: String
    error: String
    data: Index
  }

  type IndexListResponse {
    status: Int!
    message: String
    error: String
    data: [Index]
  }

  extend type Query {
    indexesByCategory(categoryId: ID!): IndexListResponse
    index(id: ID!): IndexResponse
  }

  extend type Mutation {
    createIndex(
      name: String!
      description: String
      categoryId: ID!
    ): IndexResponse

    updateIndex(
      id: ID!
      name: String
      description: String
      categoryId: ID
    ): IndexResponse

    deleteIndex(id: ID!): IndexResponse
  }
`;

export default indexTypeDefs;
