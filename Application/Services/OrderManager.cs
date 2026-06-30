using Application.DTOs;
using Application.Interfaces;
using Entities.Enums;
using Entities.Models;
using AutoMapper;

namespace Application.Services;

public class OrderManager : IOrderService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public OrderManager(IRepository<Order> orderRepository, IProductRepository productRepository,  IMapper mapper )
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<bool> CreateOrderAsync(int customerId, CreateOrderDto dto)
    {
        if (dto.Items == null || !dto.Items.Any())
            throw new InvalidOperationException("Sipariş vermek için sepetinizde en az bir ürün olmalıdır.");

        // ana sipariş nesnesini oluşturuyoruz
        var order = new Order
        {
            CustomerId = customerId,
            Status = OrderStatus.New,
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
    // müşterinin kendi siparişlerini listelediği metot
    public async Task<IEnumerable<OrderDto>> GetOrdersByCustomerIdAsync(int customerId)
    {
        // EF Core a OrderItems ve onların içindeki Product ı da getirmesini söylüyoruz.
        var orders = await _orderRepository.GetAllAsync(
            o => o.CustomerId == customerId, 
            "OrderItems.Product"
        );

        return _mapper.Map<IEnumerable<OrderDto>>(orders);
    }

    // adminin sistemdeki tüm siparişleri listelediği metot
    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await _orderRepository.GetAllAsync(
            null, 
            "OrderItems.Product" 
        );

        return _mapper.Map<IEnumerable<OrderDto>>(orders);
    }
    public async Task UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto updateDto)
    {
        // siparişi bul
        var order = await _orderRepository.GetByIdAsync(orderId);
        
        // sipariş yoksa exception fırlat 
        if (order == null)
        {
            throw new KeyNotFoundException($"ID'si {orderId} olan sipariş bulunamadı.");
        }

        // durumu güncelle ve kaydet
        order.Status = updateDto.Status;
        
        await _orderRepository.UpdateAsync(order);
        await _orderRepository.SaveChangesAsync();
    }
}