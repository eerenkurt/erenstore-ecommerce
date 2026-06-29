using Application.DTOs;
using Application.Interfaces;
using Entities.Models;

namespace Application.Services;

public class OrderManager : IOrderService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IProductRepository _productRepository;

    public OrderManager(IRepository<Order> orderRepository, IProductRepository productRepository)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
    }

    public async Task<bool> CreateOrderAsync(int customerId, CreateOrderDto dto)
    {
        if (dto.Items == null || !dto.Items.Any())
            throw new InvalidOperationException("Sipariş vermek için sepetinizde en az bir ürün olmalıdır.");

        // ana sipariş nesnesini oluşturuyoruz
        var order = new Order
        {
            CustomerId = customerId,
            Status = "Processing",
            CreatedDate = DateTime.UtcNow
        };

        decimal totalAmount = 0;

        // müşterinin gönderdiği ürünleri tek tek dönüyoruz
        foreach (var item in dto.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null)
                throw new KeyNotFoundException($"Id'si {item.ProductId} olan ürün bulunamadı.");

            // stok Kontrolü
            if (product.Stock < item.Quantity)
                throw new InvalidOperationException($"'{product.Name}' ürünü için yetersiz stok! Kalan stok: {product.Stock}");

            // stoğu düşüyoruz
            product.Stock -= item.Quantity;
            await _productRepository.UpdateAsync(product);

            // sipariş kalemini (OrderItem) hazırlıyoruz
            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                Price = product.Price, // sipariş anındaki fiyatı kilitliyoruz
                CreatedDate = DateTime.UtcNow
            };

            order.OrderItems.Add(orderItem);
            totalAmount += (product.Price * item.Quantity);
        }

        order.TotalAmount = totalAmount;

        // veritabanına tek seferde kaydediyoruz
        await _orderRepository.AddAsync(order);
        await _orderRepository.SaveChangesAsync();

        return true;
    }
}