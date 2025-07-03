const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu - PetConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🐾 PetConnect</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Đặt lại mật khẩu</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Chào bạn,
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
              Nhấn vào nút bên dưới để tạo mật khẩu mới:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold;
                        display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hoặc copy và dán link sau vào trình duyệt:
            </p>
            
            <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; line-height: 1.4;">
                <strong>Lưu ý:</strong><br>
                • Link này chỉ có hiệu lực trong 1 giờ<br>
                • Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này<br>
                • Vì lý do bảo mật, chúng tôi không thể hiển thị mật khẩu cũ của bạn
              </p>
            </div>
          </div>
          
          <div style="background: #343a40; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 PetConnect. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash reset token
const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  sendPasswordResetEmail,
  generateResetToken,
  hashResetToken
};
