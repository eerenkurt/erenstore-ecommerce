using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    // GET: api/cart sepetimi getir
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var customerId = GetUserIdFromToken();
        var cart = await _cartService.GetCartAsync(customerId);
        return Ok(cart);
    }

    // POST: api/cart sepete ürün ekle
    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var customerId = GetUserIdFromToken();
        await _cartService.AddToCartAsync(customerId, dto);
        return Ok(new { message = "Ürün sepete eklendi." });
    }

    // PUT: api/cart/{id} sepetteki bir satırın adedini güncelle
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemDto dto)
    {
        var customerId = GetUserIdFromToken();
        var result = await _cartService.UpdateCartItemAsync(customerId, id, dto);

        if (!result)
            return NotFound(new { message = $"Id'si {id} olan sepet satırı bulunamadı." });

        return Ok(new { message = "Sepet güncellendi." });
    }

    // DELETE: api/cart/{id} sepetten ürün çıkar
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> RemoveCartItem(int id)
    {
        var customerId = GetUserIdFromToken();
        var result = await _cartService.RemoveCartItemAsync(customerId, id);

        if (!result)
            return NotFound(new { message = $"Id'si {id} olan sepet satırı bulunamadı." });

        return Ok(new { message = "Ürün sepetten çıkarıldı." });
    }
    
    private int GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("Token geçersiz veya User ID bulunamadı.");

        return int.Parse(userIdClaim.Value);
    }
}