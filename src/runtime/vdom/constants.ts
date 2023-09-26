/**
 * Is Content Reference Node:
 * This node is a content reference node.
 */
export const CONTENT_REFERENCE_NODE = 's-cn';

/**
 * Is a slot reference node:
 * This is a node that represents where a slot
 * was originally located.
 */
export const IS_SLOT_REFERENCE = 's-sr';

/**
 * Slot name
 */
export const SLOT_NAME = 's-sn';

/**
 * Host element tag name:
 * The tag name of the host element that this
 * node was created in.
 */
export const HOST_ELEMENT_TAG_NAME = 's-hn';

/**
 * Original Location Reference:
 * A reference pointing to the comment
 * which represents the original location
 * before it was moved to its slot.
 */
export const ORIGINAL_LOCATION_REFERENCE = 's-ol';

/**
 * Node reference:
 * This is a reference for a original location node
 * back to the node that's been moved around.
 */
export const NODE_REFERENCE = 's-nr';

/**
 * Scope Id
 */
export const SCOPE_ID = 's-si';

/**
 * Host Id (hydrate only)
 */
export const HOST_ID = 's-host-id';

/**
 * Node Id (hydrate only)
 */
export const NODE_ID = 's-node-id';

/**
 * Used to know the components encapsulation.
 * empty "" for shadow, "c" from scoped
 */
export const ENCAPSULATION_TYPE = 's-en';
