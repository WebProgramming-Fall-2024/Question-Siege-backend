exports.createQuestion = (req, res) => {
    const { questionText, options, correctAnswer, difficulty, category } = req.body;

    // Validate and process the data here
    // Save to database or in-memory store
    res.status(201).json({ message: 'Question created successfully!' });
};

exports.getCategories = (req, res) => {
    // Example static data; replace with database logic
    const categories = ['Math', 'Science', 'History', 'Literature'];
    res.status(200).json(categories);
};
