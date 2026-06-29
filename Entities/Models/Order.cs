namespace Entities.Models;

public class Order : BaseModel
{
    public int CustomerId { get; set; }
    
    public User Customer { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Pending";

    // bir siparişe ait birden fazla sipariş kalemi (ürün) olabilir
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}