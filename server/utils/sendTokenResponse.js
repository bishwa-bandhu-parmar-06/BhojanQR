const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name || user.restaurantName,
        email: user.email,
        role: user.role,
        status: user.status, 
        restaurantName: user.restaurantName,
        ownerName: user.ownerName,
        mobile: user.mobile
      },
    });
};

module.exports = sendTokenResponse;
