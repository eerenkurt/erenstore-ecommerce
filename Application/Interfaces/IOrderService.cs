using Application.DTOs;

namespace Application.Interfaces;

public interface IOrderService
{
    Task<bool> CreateOrderAsync(int customerId, CreateOrderDto dto);
    Task<IEnumerable<OrderDto>> GetOrdersByCustomerIdAsync(int customerId);

    Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
}