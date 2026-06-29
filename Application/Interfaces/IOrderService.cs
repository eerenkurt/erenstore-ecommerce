using Application.DTOs;

namespace Application.Interfaces;

public interface IOrderService
{
    Task<bool> CreateOrderAsync(int customerId, CreateOrderDto dto);
}