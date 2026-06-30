using Entities.Enums;

namespace Application.DTOs;

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}