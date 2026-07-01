// Application/Interfaces/IOrderService.cs
using Application.DTOs;

namespace Application.Interfaces;

public interface IOrderService
{
    Task<bool> CreateOrderAsync(int customerId);
    Task<IEnumerable<OrderDto>> GetOrdersByCustomerIdAsync(int customerId);

    Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
    Task UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto updateDto);
}