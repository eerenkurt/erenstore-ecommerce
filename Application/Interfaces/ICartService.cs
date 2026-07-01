using Application.DTOs;

namespace Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int customerId);
    Task AddToCartAsync(int customerId, AddToCartDto dto);
    Task<bool> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto);
    Task<bool> RemoveCartItemAsync(int customerId, int cartItemId);
}