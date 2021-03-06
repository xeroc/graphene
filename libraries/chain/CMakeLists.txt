file(GLOB HEADERS "include/graphene/chain/*.hpp")

## SORT .cpp by most likely to change / break compile
add_library( graphene_chain

             # As database takes the longest to compile, start it first
             database.cpp
             fork_database.cpp

#             db_balance.cpp
#             db_block.cpp
#             db_debug.cpp
#             db_getter.cpp
#             db_init.cpp
#             db_maint.cpp
#             db_management.cpp
#             db_market.cpp
#             db_update.cpp
#             db_witness_schedule.cpp

             protocol/types.cpp
             protocol/address.cpp
             protocol/authority.cpp
             protocol/asset.cpp
             protocol/assert.cpp
             protocol/account.cpp
             protocol/transfer.cpp
             protocol/committee_member.cpp
             protocol/witness.cpp
             protocol/market.cpp
             protocol/proposal.cpp
             protocol/withdraw_permission.cpp
             protocol/asset_ops.cpp
             protocol/memo.cpp
             protocol/worker.cpp
             protocol/custom.cpp
             protocol/operations.cpp
             protocol/transaction.cpp
             protocol/block.cpp
             protocol/fee_schedule.cpp
             protocol/confidential.cpp
             protocol/vote.cpp

             genesis_state.cpp
             get_config.cpp

             pts_address.cpp

             evaluator.cpp
             balance_evaluator.cpp
             account_evaluator.cpp
             assert_evaluator.cpp
             witness_evaluator.cpp
             committee_member_evaluator.cpp
             asset_evaluator.cpp
             transfer_evaluator.cpp
             proposal_evaluator.cpp
             market_evaluator.cpp
             vesting_balance_evaluator.cpp
             withdraw_permission_evaluator.cpp
             worker_evaluator.cpp
             confidential_evaluator.cpp

             account_object.cpp
             asset_object.cpp
             proposal_object.cpp
             vesting_balance_object.cpp

             block_database.cpp

             ${HEADERS}
           )

target_link_libraries( graphene_chain fc graphene_db )
target_include_directories( graphene_chain
                            PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include" )

if(MSVC)
  set_source_files_properties( db_init.cpp db_block.cpp database.cpp block_database.cpp PROPERTIES COMPILE_FLAGS "/bigobj" )
endif(MSVC)

INSTALL( TARGETS
   graphene_chain

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
