import React from 'react'
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md'

import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../util/format'
import { Container, ProductTable, Total } from './styles'

interface Product {
  id: number
  title: string
  price: number
  image: string
  amount: number
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart()

  const cartFormatted = cart.map((product) => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    subTotal: formatPrice(product.price * product.amount),
  }))
  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      sumTotal += product.price * product.amount

      return sumTotal
    }, 0)
  )

  function handleProductIncrement(product: Product) {
    updateProductAmount({ productId: product.id, amount: 1 })
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({ productId: product.id, amount: -1 })
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      {cartFormatted.map(
        (
          { id, amount, image, priceFormatted, subTotal, title, price },
          index
        ) => (
          <ProductTable key={id * Math.random() + index + 1}>
            <thead>
              <tr>
                <th aria-label='product image' />
                <th>PRODUTO</th>
                <th>QTD</th>
                <th>SUBTOTAL</th>
                <th aria-label='delete icon' />
              </tr>
            </thead>
            <tbody>
              <tr data-testid='product'>
                <td>
                  <img src={image} alt={title} />
                </td>
                <td>
                  <strong>{title}</strong>
                  <span>{priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type='button'
                      data-testid='decrement-product'
                      disabled={amount <= 1}
                      onClick={() =>
                        handleProductDecrement({
                          id,
                          amount,
                          image,
                          title,
                          price,
                        })
                      }
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type='text'
                      data-testid='product-amount'
                      readOnly
                      value={amount}
                    />
                    <button
                      type='button'
                      data-testid='increment-product'
                      onClick={() =>
                        handleProductIncrement({
                          id,
                          amount,
                          image,
                          title,
                          price,
                        })
                      }
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{subTotal}</strong>
                </td>
                <td>
                  <button
                    type='button'
                    data-testid='remove-product'
                    onClick={() => handleRemoveProduct(id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            </tbody>
          </ProductTable>
        )
      )}
      <footer>
        <button type='button'>Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total || formatPrice(0)}</strong>
        </Total>
      </footer>
    </Container>
  )
}

export default Cart
