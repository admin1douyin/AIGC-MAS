module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pure JS endpoint works',
    timestamp: new Date().toISOString()
  });
};
