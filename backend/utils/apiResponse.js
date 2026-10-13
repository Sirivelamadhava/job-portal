class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static paginated(res, message = 'Data retrieved successfully', data = [], pagination = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;
