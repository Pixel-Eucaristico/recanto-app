import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with default classes', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col', 'gap-6', 'rounded-xl', 'border', 'py-6', 'shadow-sm')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('renders card with custom className', () => {
      render(<Card className="custom-class" data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('passes through other props', () => {
      render(<Card id="test-card" data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'test-card')
    })
  })

  describe('CardHeader', () => {
    it('renders card header with default classes', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('@container/card-header', 'grid', 'auto-rows-min')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('renders card header with custom className', () => {
      render(<CardHeader className="custom-header" data-testid="card-header">Header content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('renders card title with default classes', () => {
      render(<CardTitle data-testid="card-title">Title content</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('leading-none', 'font-semibold')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('renders card title with custom className', () => {
      render(<CardTitle className="custom-title" data-testid="card-title">Title content</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('renders card description with default classes', () => {
      render(<CardDescription data-testid="card-description">Description content</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
      expect(description).toHaveAttribute('data-slot', 'card-description')
    })

    it('renders card description with custom className', () => {
      render(<CardDescription className="custom-description" data-testid="card-description">Description content</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('custom-description')
    })
  })

  describe('CardAction', () => {
    it('renders card action with default classes', () => {
      render(<CardAction data-testid="card-action">Action content</CardAction>)
      const action = screen.getByTestId('card-action')
      expect(action).toBeInTheDocument()
      expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1', 'self-start', 'justify-self-end')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })

    it('renders card action with custom className', () => {
      render(<CardAction className="custom-action" data-testid="card-action">Action content</CardAction>)
      const action = screen.getByTestId('card-action')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('CardContent', () => {
    it('renders card content with default classes', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('px-6')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })

    it('renders card content with custom className', () => {
      render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('renders card footer with default classes', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })

    it('renders card footer with custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="card-footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader data-testid="complete-header">
            <CardTitle data-testid="complete-title">Test Title</CardTitle>
            <CardDescription data-testid="complete-description">Test Description</CardDescription>
            <CardAction data-testid="complete-action">Action</CardAction>
          </CardHeader>
          <CardContent data-testid="complete-content">
            Test Content
          </CardContent>
          <CardFooter data-testid="complete-footer">
            Test Footer
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByTestId('complete-header')).toBeInTheDocument()
      expect(screen.getByTestId('complete-title')).toBeInTheDocument()
      expect(screen.getByTestId('complete-description')).toBeInTheDocument()
      expect(screen.getByTestId('complete-action')).toBeInTheDocument()
      expect(screen.getByTestId('complete-content')).toBeInTheDocument()
      expect(screen.getByTestId('complete-footer')).toBeInTheDocument()

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })
  })
})