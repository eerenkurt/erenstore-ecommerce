// Application/Services/OrderManager.cs
using Application.DTOs;
using Application.Interfaces;
using Entities.Enums;
using Entities.Models;
using AutoMapper;

namespace Application.Services;

public class OrderManager : IOrderService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IRepository<CartItem> _cartItemRepository;
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public OrderManager(IRepository<Order> orderRepository, IRepository<CartItem> cartItemRepository, IProductRepository productRepository, IMapper mapper)
    {
        _orderRepository = orderRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<bool> CreateOrderAsync(int customerId)
    {
        // müşterinin sepetindeki tüm satırları, ürün bilgisiyle birlikte çekiyoruz
        var cartItems = await _cartItemRepository.GetAllAsync(
            ci => ci.CustomerId == customerId,
            "Product"
        );

        if (cartItems == null || !cartItems.Any())
            throw new InvalidOperationException("Sipariş vermek için sepetinizde en az bir ürün olmalıdır.");

        var order = new Order
        {
            CustomerId = customerId,
            Status = OrderStatus.New,
            CreatedDate = DateTime.UtcNow
        };

        decimal totalAmount = 0;

        // sepetteki her satırı sipariş kalemine çeviriyoruz
        foreach (var cartItem in cartItems)
        {
            var product = cartItem.Product;

            // stok kontrolü
            if (product.Stock < cartItem.Quantity)
                throw new InvalidOperationException($"'{product.Name}' ürünü için yetersiz stok! Kalan stok: {product.Stock}");

            // stoğu düşüyoruz
            product.Stock -= cartItem.Quantity;
            await _productRepository.UpdateAsync(product);

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                Quantity = cartItem.Quantity,
                Price = product.Price, // sipariş anındaki fiyatı kilitliyoruz
                CreatedDate = DateTime.UtcNow
            };

            order.OrderItems.Add(orderItem);
            totalAmount += product.Price * cartItem.Quantity;
        }

        order.TotalAmount = totalAmount;

        await _orderRepository.AddAsync(order);
        await _orderRepository.SaveChangesAsync();

        // sipariş başarıyla oluştu, artık sepeti temizliyoruz
        foreach (var cartItem in cartItems)
        {
            await _cartItemRepository.DeleteAsync(cartItem);
        }
        await _cartItemRepository.SaveChangesAsync();

        return true;
    }

    // müşterinin kendi siparişlerini listelediği metot
    public async Task<IEnumerable<OrderDto>> GetOrdersByCustomerIdAsync(int customerId)
    {
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
        var order = await _orderRepository.GetByIdAsync(orderId);

        if (order == null)
        {
            throw new KeyNotFoundException($"ID'si {orderId} olan sipariş bulunamadı.");
        }

        order.Status = updateDto.Status;

        await _orderRepository.UpdateAsync(order);
        await _orderRepository.SaveChangesAsync();
    }
}