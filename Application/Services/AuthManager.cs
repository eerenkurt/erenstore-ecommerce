using Application.DTOs;
using Application.Interfaces;
using Entities.Models;

namespace Application.Services;

public class AuthManager : IAuthService
{
    private readonly IRepository<User> _userRepository;

    public AuthManager(IRepository<User> userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> RegisterAsync(RegisterDto dto)
    {
        var existingUsers = await _userRepository.GetAllAsync(u => u.Email == dto.Email);
        if (existingUsers.Any()) return false;

        var newUser = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password), 
            UserType = (Entities.Enums.UserTypes)dto.UserType,
            StoreName = dto.UserType == 2 ? dto.StoreName : null, 
            SellerStatus = dto.UserType == 2 ? Entities.Enums.SellerStatus.Pending : null 
        };

        await _userRepository.AddAsync(newUser);
        await _userRepository.SaveChangesAsync();
        return true;
    }

    // sadece kullanıcıyı kontrol eden metot:
    public async Task<User?> LoginAsync(LoginDto dto)
    {
        var users = await _userRepository.GetAllAsync(u => u.Email == dto.Email);
        var user = users.FirstOrDefault();

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
        {
            return null;
        }

        return user; 
    }
    public async Task<bool> UpdateSellerStatusAsync(int userId, bool isApproved)
    {
        // durumu güncellenecek satıcıyı veritabanında bul
        var seller = await _userRepository.GetByIdAsync(userId);
        if (seller == null || seller.UserType != Entities.Enums.UserTypes.Seller)
        {
            return false; 
        }

        // adminin kararına göre enum durumunu set et
        // approved = 2, rejected = 3.
        seller.SellerStatus = isApproved ? Entities.Enums.SellerStatus.Approved : Entities.Enums.SellerStatus.Rejected;
        seller.UpdatedDate = DateTime.UtcNow; 

        // veritabanına kaydet
        await _userRepository.UpdateAsync(seller);
        await _userRepository.SaveChangesAsync(); 
    
        return true;
    }
    
}