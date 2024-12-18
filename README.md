# Question-Siege-backend


### Backend Report: Question_Siege

---

### **Overview**
The backend of **Question_Siege** is built using **Express.js** and **Sequelize ORM**, with a **MySQL relational database** for persistent storage. It serves as the foundation for managing user interactions, game logic, and data persistence. The backend is designed to provide robust API endpoints to support a ReactJS-based frontend.

---

### **Flow of the Backend**

1. **Authentication**:
   - Users authenticate via a JWT-based token system.
   - Middleware ensures protected routes are accessible only to authenticated users.

2. **Game Logic**:
   - Players can start a game session, answer questions, and end the session.
   - Game sessions can be based on random questions or selected categories.

3. **Follow System**:
   - Users can follow and unfollow others, maintaining a social aspect in the game.
   - APIs allow fetching follow relationships, including followers and followings.

4. **CRUD Operations**:
   - Supports full CRUD functionality for users, questions, categories, and game sessions.

5. **Error Handling**:
   - Detailed error responses ensure smooth debugging and clear communication with the frontend.

---

### **Database Models**

#### 1. **User**:
- **Purpose**: Represents players in the system.
- **Fields**: 
  - `id`, `username`, `password` (hashed), `phone_number`, `signupDate`, `lastOnline`, `score`.
- **Relationships**:
  - Many-to-Many: Follow relationships.
  - Has Many: Created questions, answers.

#### 2. **Question**:
- **Purpose**: Stores quiz questions.
- **Fields**: 
  - `id`, `text`, `difficulty`, `correctAnswer`, `options` (JSON), `creator_id`, `category_id`.
- **Relationships**:
  - Belongs to: User (creator), Category.
  - Has Many: Answers.

#### 3. **Category**:
- **Purpose**: Organizes questions into groups.
- **Fields**: 
  - `id`, `name`, `description`.
- **Relationships**:
  - Has Many: Questions.

#### 4. **Follow**:
- **Purpose**: Tracks follower-followee relationships between users.
- **Fields**: 
  - `follower_id`, `followee_id`.
- **Relationships**:
  - Many-to-Many: Users.

#### 5. **Game**:
- **Purpose**: Tracks individual game sessions.
- **Fields**: 
  - `id`, `user_id`, `score`, `isActive`.
- **Relationships**:
  - Has Many: Answers.
  - Many-to-Many: Categories through GameCategory.

#### 6. **GameCategory**:
- **Purpose**: Links games with selected categories (many-to-many relationship).
- **Fields**: 
  - `game_id`, `category_id`.

#### 7. **Answer**:
- **Purpose**: Stores answers submitted by users.
- **Fields**: 
  - `id`, `game_id`, `question_id`, `user_id`, `answer`, `isCorrect`, `answeredAt`.
- **Relationships**:
  - Belongs to: User, Question, Game.

---

### **Reason for Choosing MySQL**

1. **Relational Data**:
   - MySQL excels at managing structured data and enforcing relationships between tables.
   - Example: The relationships between users, games, and questions are efficiently handled using foreign keys and join tables.

2. **Performance**:
   - MySQL is optimized for complex queries and transactions, which are crucial for fetching related data like game sessions or follow relationships.

3. **Scalability**:
   - MySQL supports horizontal scaling and is widely used in production environments for large-scale applications.

4. **Familiarity**:
   - MySQL is a popular choice among developers, ensuring robust community support and ease of collaboration.

---

### **API Endpoints**

#### **User Routes**
- `POST /api/users/signup`: Register a new user.
- `POST /api/users/login`: Authenticate a user.
- `POST /api/users/follow`: Follow another user.
- `GET /api/users/followings`: Get the list of users the logged-in user is following.
- `GET /api/users/profile`: Fetch the logged-in user's profile.
- `GET /api/users/sorted-by-score`: Get all users sorted by score.

#### **Game Routes**
- `POST /api/game/start`: Start a new game session.
- `POST /api/game/answer`: Submit an answer for the current game.
- `POST /api/game/end`: End the current game session.

#### **Question Routes**
- `POST /api/questions/create`: Create a new question.
- `GET /api/questions?category=<category>`: Fetch all questions or filter by category.

#### **Category Routes**
- `GET /api/category`: Get all categories with user-designed question counts.

---

### **How the Backend Supports the Frontend**
- Provides reusable, secure, and well-documented API endpoints.
- Enables dynamic rendering of data like questions, game sessions, and follow relationships.
- Simplifies state management in the frontend by centralizing business logic in the backend.

---

### **Conclusion**
The backend of **Question_Siege** is a robust system designed for scalability, maintainability, and efficient interaction with the frontend. It leverages MySQL's relational capabilities to handle complex relationships and Express.js's flexibility to build a comprehensive API layer.
