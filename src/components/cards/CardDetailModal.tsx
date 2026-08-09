import type { ScryfallCard } from '@/lib/types/card'
import { Modal } from '@/components/ui/Modal'
import { CardDetail } from './CardDetail'

type Props = { card: ScryfallCard; onClose: () => void }

export function CardDetailModal({ card, onClose }: Props) {
  return (
    <Modal title={card.name} onClose={onClose}>
      <CardDetail card={card} />
    </Modal>
  )
}