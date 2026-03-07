using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterRequest request)
    {
        if (_context.Users.Any(u => u.UserName == request.UserName))
            return BadRequest("Username đã tồn tại");

        if (_context.Users.Any(u => u.Email == request.Email))
            return BadRequest("Email đã tồn tại");

        var user = new User
        {
            UserName = request.UserName,
            HashPass = BCrypt.Net.BCrypt.HashPassword(request.Password),
            UserRole = "Seller",   // 👈 mặc định Seller như bạn yêu cầu trước đó
            Email = request.Email,
            Phone = request.Phone
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok("Đăng ký thành công");
    }

    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        var user = _context.Users
            .FirstOrDefault(u => u.UserName == request.UserName);

        if (user == null)
            return Unauthorized("Sai tài khoản hoặc mật khẩu");

        bool isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.HashPass);

        if (!isValid)
            return Unauthorized("Sai tài khoản hoặc mật khẩu");

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.UserRole)
        };

        var key = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes("THIS_IS_MY_SUPER_SECRET_KEY_123456789"));

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials:
                new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            role = user.UserRole
        });
    }
}