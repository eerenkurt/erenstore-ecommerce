using Entities.Enums;

namespace Entities.Models;

public class Order : BaseModel
{
    public int CustomerId { get; set; }
    
    public User Customer { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;

    // bir siparişe ait birden fazla sipariş kalemi (ürün) olabilir
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}