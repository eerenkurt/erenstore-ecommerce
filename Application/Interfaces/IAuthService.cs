using Application.DTOs;
using Entities.Models;

namespace Application.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterDto dto);
    Task<User?> LoginAsync(LoginDto dto);
    Task<bool> UpdateSellerStatusAsync(int userId, bool isApproved);
    Task<IEnumerable<SellerApplicationDto>> GetPendingSellersAsync();
}