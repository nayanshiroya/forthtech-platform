import { gql } from "apollo-server-express";

const courseTypeDefs = gql`
  type Index {
    id: ID!
    name: String!
    description: String
    categoryId: ID!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    indexId: ID!
    index: Index
  }

  type CourseResponse {
    status: Int!
    message: String
    error: String
    data: Course
  }

  type CourseListResponse {
    status: Int!
    message: String
    error: String
    data: [Course]
  }

  extend type Query {
    courses: CourseListResponse
    course(id: ID!): CourseResponse
    coursesByIndex(indexId: ID!): CourseListResponse
  }

  extend type Mutation {
    createCourse(
      title: String!
      description: String!
      indexId: ID!
    ): CourseResponse

    updateCourse(
      id: ID!
      title: String
      description: String
      indexId: ID
    ): CourseResponse

    deleteCourse(id: ID!): CourseResponse
  }
`;

export default courseTypeDefs;
