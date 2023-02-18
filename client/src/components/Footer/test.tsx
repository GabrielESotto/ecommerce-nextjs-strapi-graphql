import { renderWithTheme } from 'utils/tests/helpers'
import { screen } from '@testing-library/react'

import Footer from '.'

describe('<Footer />', () => {
  it('should render 4 columns topics', () => {
    const { container } = renderWithTheme(<Footer />)

    // Verify if exists column contact, follow us, links and location
    expect(
      screen.getByRole('heading', { name: /contact us/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: /follow us/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: /links/i })).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: /location/i })
    ).toBeInTheDocument()

    expect(container.firstChild).toMatchSnapshot()
  })
})
