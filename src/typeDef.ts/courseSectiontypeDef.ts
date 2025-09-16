import { gql } from "apollo-server-express";

const courseSectionTypeDefs = gql`
type Exercise {
  id: ID!
  question: String!
  hint: String
  solution: String
}

type Quiz {
  id: ID!
  question: String!
  options: [String!]!
  answer: String!
}

  type SectionContent {
    markdown: String
    exercises: [Exercise]
    quizzes: [Quiz]
  }

  type Section {
    id: ID!
    courseId: ID!
    title: String!
    content: SectionContent!
  }

  type SectionResponse {
    status: Int!
    message: String
    error: String
    data: Section
  }

  type SectionListResponse {
    status: Int!
    message: String
    error: String
    data: [Section]
  }

  input ExerciseInput {
    id: ID  
    question: String
    hint: String
    solution: String
  }

  input QuizInput {
    id: ID 
    question: String
    options: [String]
    answer: String
  }

  extend type Query {
    sectionsByCourse(courseId: ID!): SectionListResponse
    section(id: ID!): SectionResponse
  }

  extend type Mutation {
    createSection(
      courseId: ID!
      title: String!
      markdown: String
      exercises: [ExerciseInput]
      quizzes: [QuizInput]
    ): SectionResponse

    updateSection(
      id: ID!
      title: String
      markdown: String
      exercises: [ExerciseInput]
      quizzes: [QuizInput]
    ): SectionResponse

  deleteSection(id: ID!): SectionResponse
  deleteExercise(sectionId: ID!, exerciseId: ID!): SectionResponse
  deleteQuiz(sectionId: ID!, quizId: ID!): SectionResponse
  }
`;

export default courseSectionTypeDefs;
