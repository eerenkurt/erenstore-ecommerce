using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    // hem IAuthService hem de appsettings.json'ı okumak için IConfiguration enjekte ediyoruz
    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);

        if (!result)
        {
            return BadRequest(new { message = "Bu email adresi zaten kullanımda veya geçersiz." });
        }

        return Ok(new { message = "Kayıt işlemi başarıyla tamamlandı." });
    }

    [HttpPost("login")] // api/auth/login adresine gelecek POST istekleri için
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // veritabanında kullanıcı var mı diye servis katmanına soruyoruz
        var user = await _authService.LoginAsync(dto);

        if (user == null)
        {
            // kullanıcı yoksa veya şifre eşleşmediyse 401 Unauthorized dönüyoruz
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });
        }

        // kullanıcı bulundu şimdi onun bilgilerini (Claim) dijital karta yazıyoruz
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.UserType.ToString()) // "Admin", "Seller", "Customer"
        };

        // appsettings.json'daki JwtSettings altından gizli anahtarı (SecretKey) çekiyoruz
        var secretKey = _configuration["JwtSettings:SecretKey"] ?? "ErenStore-Super-Secret-Key-Min-32-Characters!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // token ayarlarını yapılandırıyoruz 
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(60), // 1 saat geçerli token
            Issuer = _configuration["JwtSettings:Issuer"] ?? "ErenStore",
            Audience = _configuration["JwtSettings:Audience"] ?? "ErenStoreUsers",
            SigningCredentials = creds
        };

        // token'ı oluşturup string dizesine çeviriyoruz
        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(securityToken);

        // giriş yapan kullanıcıya token'ı teslim ediyoruz
        return Ok(new { 
            token = tokenString, 
            message = "Giriş başarılı!" 
        });
    }
}